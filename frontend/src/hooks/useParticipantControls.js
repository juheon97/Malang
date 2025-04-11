// // hooks/useParticipantControls.js
// import { useState } from 'react';

// export default function useParticipantControls(isHost) {
//   const [participantControls, setParticipantControls] = useState({});

//   const toggleParticipantSpeaking = participantId => {
//     setParticipantControls(prev => ({
//       ...prev,
//       [participantId]: {
//         ...prev[participantId],
//         canSpeak: !prev[participantId]?.canSpeak,
//       },
//     }));

//     return !participantControls[participantId]?.canSpeak;
//   };

//   const toggleParticipantControls = participantId => {
//     setParticipantControls(prev => ({
//       ...prev,
//       [participantId]: {
//         ...prev[participantId],
//         showControls: !prev[participantId]?.showControls,
//       },
//     }));
//   };

//   const initParticipantControls = participants => {
//     const initialControls = {};
//     participants.forEach(p => {
//       if (!p.isSelf) {
//         initialControls[p.id] = { showControls: false, canSpeak: p.canSpeak };
//       }
//     });
//     setParticipantControls(initialControls);
//   };

//   return {
//     participantControls,
//     toggleParticipantSpeaking,
//     toggleParticipantControls,
//     initParticipantControls,
//   };
// }
