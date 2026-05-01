# Syncode – Real-time Coding Collaboration
A collaborative coding platform with real-time editing, cursor tracking, room-based collaboration, and multi-language code execution.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4ea94b?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-black?style=for-the-badge&logo=socketdotio&badgeColor=010101)

It supports both **authenticated users and guests**, allowing seamless participation through **room codes or invite links**.

The platform enables real-time interaction powered by **WebSockets**, along with an integrated **code editor and execution system** for collaborative development.

---

## Live Demo

Frontend: https://syncode-live.vercel.app  

Backend: https://syncode-backend-6tnl.onrender.com

⚠️ Note: The backend is hosted on Render's free tier.  
After periods of inactivity, the server may go to sleep.  
The first request may take **50–80 seconds** while the service wakes up.

---

## Features

### Real-time Collaboration
Users in the same room receive updates instantly using **Socket.IO**, enabling real-time interaction without refreshing the page.

### Room Creation
Authenticated users can create collaboration rooms and manage participants.

### Invite Links
Each room generates a unique invite link that can be shared directly.

Example:
`https://syncode-live.vercel.app/room/{roomId}`

### Room Codes
Users can join rooms by entering a **room code** manually.

### Guest Access
Guests can join rooms without creating an account, making collaboration quick and accessible.

### Cursor Tracking
Participants can see **live cursor positions** of other users inside the editor, enabling a collaborative editing experience.

### Timeline History
Room activity events are recorded in a **timeline**, allowing users to track important actions during a collaboration session.

### Secure Authentication
Authentication is implemented using **JWT tokens with HTTP-only cookies** for secure session management.

### User Management
Includes a full authentication system:

- user registration
- login / logout
- forgot password
- password reset via email

Password reset functionality is implemented using **Nodemailer**.

### Code Editor
A powerful in-browser editor powered by **Monaco Editor**, providing a coding experience similar to VS Code.

### Smooth UI Experience
The interface is built with:

- **shadcn/ui** for accessible UI components
- **Framer Motion** for smooth animations and transitions

---

## Tech Stack

### Frontend
- React
- React Router
- Axios
- Socket.IO Client
- Monaco Editor
- shadcn/ui
- Framer Motion

### Backend
- Node.js
- Express.js
- Socket.IO
- JWT Authentication
- bcrypt

### Database
- MongoDB

### Deployment
Frontend: Vercel  
Backend: Render  
Database: MongoDB Atlas

---

## Architecture

Syncode uses a real-time architecture powered by **Socket.IO**.  
Room-based collaboration allows participants to receive instant updates for editor changes, cursor movements, and timeline events.

The frontend communicates with the backend via REST APIs and WebSocket connections.

---

## Code Execution

Code execution is implemented with a hybrid approach:

- **JavaScript / TypeScript** → executed locally using the Node runtime
- **Other languages** → executed using the JDoodle API

⚠️ JDoodle provides limited execution credits per day.

For security reasons, production systems should execute user code inside **sandboxed containers**.

Future improvements include implementing **Docker-based sandbox execution** to safely isolate and run user programs.

---

## Author


Developed by **[sujalsoni19](https://github.com/sujalsoni19)**
