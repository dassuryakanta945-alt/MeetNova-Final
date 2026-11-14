import { useEffect, useRef, useState } from "react";
import "./MeetingRoom.css";
import { auth, rtdb } from "./firebase";

import {
  ref,
  set,
  push,
  onValue,
  onChildAdded,
  remove,
  onDisconnect,
} from "firebase/database";

const ICE_SERVERS = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

function MeetingRoom({ meeting, onLeave, isMinimized, onMinimizeChange }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [error, setError] = useState("");
  const [streamReady, setStreamReady] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const peerConnections = useRef({});
  const participantListeners = useRef([]);
  const pendingCandidates = useRef({});
  const offerCreated = useRef({});
  const handledOffers = useRef({});

  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        setStreamReady(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera/Microphone error:", err);
        setError(
          "Camera or microphone access denied. Please allow permissions."
        );
      }
    };

    startCamera();

    return () => {
      mounted = false;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

 useEffect(() => {
  const user = auth.currentUser;

  if (!user || !meeting?.id) return;

  let active = true;
  let unsubscribe = null;

  const participantRef = ref(
    rtdb,
    `meetingRooms/${meeting.id}/participants/${user.uid}`
  );

  const registerParticipant = async () => {
    try {
      await set(participantRef, true);

      if (!active) {
        await remove(participantRef);
        return;
      }

      await onDisconnect(participantRef).remove();

      unsubscribe = onValue(
        ref(rtdb, `meetingRooms/${meeting.id}/participants`),
        (snapshot) => {
          const data = snapshot.val() || {};
          setParticipants(Object.keys(data));
        }
      );
    } catch (err) {
      console.error("Participant registration failed:", err);
      setError("Unable to join the meeting. Please try again.");
    }
  };

  registerParticipant();

  return () => {
    active = false;

    if (unsubscribe) unsubscribe();

    remove(participantRef).catch(console.error);
  };
}, [meeting?.id]);

  const createPeerConnection = (remoteUid) => {
    const user = auth.currentUser;

    if (!user) return null;

    // Existing connection reuse karo
    if (peerConnections.current[remoteUid]) {
      return peerConnections.current[remoteUid];
    }

    const peer = new RTCPeerConnection(ICE_SERVERS);

    // Local camera aur microphone tracks add karo
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        peer.addTrack(track, streamRef.current);
      });
    }

    // Dusre participant ka audio/video receive karo
    peer.ontrack = (event) => {
      const remoteStream = event.streams[0];

      if (!remoteStream) return;

      setRemoteStreams((previous) => {
        const exists = previous.some(
          (item) => item.uid === remoteUid
        );

        if (exists) {
          return previous.map((item) =>
            item.uid === remoteUid
              ? { ...item, stream: remoteStream }
              : item
          );
        }

        return [
          ...previous,
          { uid: remoteUid, stream: remoteStream },
        ];
      });
    };

    // ICE candidates Firebase mein save karo
    peer.onicecandidate = async (event) => {
      if (!event.candidate) return;

      const candidateRef = ref(
        rtdb,
        `meetingRooms/${meeting.id}/signals/${user.uid}/${remoteUid}/candidates`
      );

      await push(candidateRef, event.candidate.toJSON());
    };

    peerConnections.current[remoteUid] = peer;

    return peer;
  };

    const createOffer = async (remoteUid) => {
  if (offerCreated.current[remoteUid]) return;

  offerCreated.current[remoteUid] = true;

  try {
    const peer = createPeerConnection(remoteUid);

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    const user = auth.currentUser;

    await set(
      ref(
        rtdb,
        `meetingRooms/${meeting.id}/signals/${user.uid}/${remoteUid}/offer`
      ),
      {
        type: offer.type,
        sdp: offer.sdp,
      }
    );
  } catch (err) {
    offerCreated.current[remoteUid] = false;
    console.error("Offer creation error:", err);
  }
};

    const handleIncomingOffer = async (remoteUid, offer) => {
  try {
    const peer = createPeerConnection(remoteUid);

    await peer.setRemoteDescription(
      new RTCSessionDescription(offer)
    );

    await flushPendingCandidates(remoteUid);

    const answer = await peer.createAnswer();

    await peer.setLocalDescription(answer);

    const user = auth.currentUser;

    await set(
      ref(
        rtdb,
        `meetingRooms/${meeting.id}/signals/${remoteUid}/${user.uid}/answer`
      ),
      {
        type: answer.type,
        sdp: answer.sdp,
      }
    );
  } catch (err) {
    console.error("Incoming offer error:", err);
  }
};

  const handleIncomingCandidate = async (remoteUid, candidateData) => {
  try {
    if (!candidateData) return;

    const candidate = new RTCIceCandidate(candidateData);
    const peer = peerConnections.current[remoteUid];

    if (!peer || !peer.remoteDescription) {
      if (!pendingCandidates.current[remoteUid]) {
        pendingCandidates.current[remoteUid] = [];
      }

      pendingCandidates.current[remoteUid].push(candidate);
      return;
    }

    await peer.addIceCandidate(candidate);
  } catch (err) {
    console.error("ICE candidate error:", err);
  }
};
const flushPendingCandidates = async (remoteUid) => {
  const peer = peerConnections.current[remoteUid];
  const candidates = pendingCandidates.current[remoteUid] || [];

  if (!peer?.remoteDescription) return;

  for (const candidate of candidates) {
    try {
      await peer.addIceCandidate(candidate);
    } catch (err) {
      console.error("Pending ICE error:", err);
    }
  }

  pendingCandidates.current[remoteUid] = [];
};

useEffect(() => {
  const user = auth.currentUser;
  const roomId = meeting?.id;

  if (!user || !roomId || !streamReady) return;

  const unsubscribers = [];

  const remoteParticipants = participants.filter(
    (uid) => uid !== user.uid
  );

  remoteParticipants.forEach((remoteUid) => {
    // 1. Incoming Offer Listener
    const offerRef = ref(
      rtdb,
      `meetingRooms/${roomId}/signals/${remoteUid}/${user.uid}/offer`
    );

    const unsubscribeOffer = onValue(offerRef, (snapshot) => {
      const offer = snapshot.val();

      if (!offer || handledOffers.current[remoteUid]) return;

      handledOffers.current[remoteUid] = true;
      handleIncomingOffer(remoteUid, offer);
    });

    unsubscribers.push(unsubscribeOffer);

    // 2. Incoming Answer Listener
    const answerRef = ref(
      rtdb,
      `meetingRooms/${roomId}/signals/${user.uid}/${remoteUid}/answer`
    );

    const unsubscribeAnswer = onValue(answerRef, async (snapshot) => {
      const answer = snapshot.val();
      const peer = peerConnections.current[remoteUid];

      if (!answer || !peer || peer.remoteDescription) return;

      try {
        await peer.setRemoteDescription(
          new RTCSessionDescription(answer)
        );

        await flushPendingCandidates(remoteUid);
      } catch (err) {
        console.error("Answer handling error:", err);
      }
    });

    unsubscribers.push(unsubscribeAnswer);

    // 3. Incoming ICE Candidate Listener
    const candidateRef = ref(
      rtdb,
      `meetingRooms/${roomId}/signals/${remoteUid}/${user.uid}/candidates`
    );

    const unsubscribeCandidates = onChildAdded(
      candidateRef,
      (snapshot) => {
        handleIncomingCandidate(remoteUid, snapshot.val());
      }
    );

    unsubscribers.push(unsubscribeCandidates);

    // 4. Only one participant creates the offer
    if (user.uid < remoteUid) {
      createOffer(remoteUid);
    }
  });

  return () => {
    unsubscribers.forEach((unsubscribe) => unsubscribe());
  };
}, [participants, streamReady, meeting?.id]);

  const toggleCamera = () => {
    const stream = streamRef.current;
    if (!stream) return;

    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;

    videoTrack.enabled = !videoTrack.enabled;
    setCameraOn(videoTrack.enabled);
  };

  const toggleMic = () => {
    const stream = streamRef.current;
    if (!stream) return;

    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) return;

    audioTrack.enabled = !audioTrack.enabled;
    setMicOn(audioTrack.enabled);
  };

  const handleLeave = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    onLeave();
  };
useEffect(() => {
  return () => {
    Object.values(peerConnections.current).forEach((peer) => {
      peer.close();
    });

    peerConnections.current = {};
    pendingCandidates.current = {};
    offerCreated.current = {};
    handledOffers.current = {};
  };
}, []);

  return (
    <div className={`meeting-room-page ${isMinimized ? "is-minimized" : ""}`}>
      <div className="meeting-room-card">
        <span className="meeting-room-label">MEETNOVA MEETING ROOM</span>

        <h1>{meeting?.title || "Meeting Room"}</h1>

        <div className="meeting-room-id">
          <span>Meeting ID</span>
          <strong>{meeting?.id}</strong>
        </div>

        <div className="meeting-video-container">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="meeting-local-video"
          />

          {!cameraOn && (
            <div className="camera-off-overlay">
              Camera is off
            </div>
          )}
        </div>
        {remoteStreams.length > 0 && (
  <div className="meeting-remote-grid">
    {remoteStreams.map(({ uid, stream }) => (
      <div className="meeting-remote-video-card" key={uid}>
        <video
          autoPlay
          playsInline
          ref={(video) => {
            if (video && video.srcObject !== stream) {
              video.srcObject = stream;
            }
          }}
        />
        <span className="meeting-participant-name">
          Participant {uid.slice(0, 6)}
        </span>
      </div>
    ))}
  </div>
)}

        {error && <p className="meeting-error">{error}</p>}
    
        <div className="meeting-controls">
            <button
              onClick={() => onMinimizeChange(!isMinimized)}
              className="meeting-minimize-button"
            >
              {isMinimized ? "Expand Meeting" : "Minimize Meeting"}
            </button>

          <button onClick={toggleMic}>
            {micOn ? "Mute Mic" : "Unmute Mic"}
          </button>

          <button onClick={toggleCamera}>
            {cameraOn ? "Turn Camera Off" : "Turn Camera On"}
          </button>

          <button onClick={handleLeave} className="meeting-leave-button">
            Leave Meeting
          </button>
        </div>
      </div>
    </div>
  );
}

export default MeetingRoom;