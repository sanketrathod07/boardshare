# BoardShare

BoardShare is an advanced real-time collaborative whiteboard application with handwriting recognition, specifically designed for solving mathematical expressions. It allows users to draw, annotate, and interact with a shared canvas while leveraging a machine learning model to recognize and process handwritten mathematical equations.

---

## Features Overview

### 1. **Real-Time Collaboration**

- Multi-user support with organization-based access.
- Seamless board sharing with live updates.
- Users can create, edit, and delete boards.

### 2. **Canvas & Drawing Tools**

- Freehand drawing with customizable stroke thickness and colors.
- Text insertion for annotations.
- Shape drawing tools (circles, rectangles, lines, etc.).
- Undo/Redo functionality for enhanced usability.

### 3. **Handwriting Recognition**

- BoardShare processes handwritten mathematical expressions.
- Recognizes arithmetic operations, algebraic equations, roots, fractions, and more.
- Converts handwritten input into LaTeX or digital text for further processing.

### 4. **Authentication & User Management**

- Secure authentication using **Clerk**.
- Organization management with invite-based access control.
- Role-based permissions for board interactions.

---

## Frontend Development

### Tech Stack

- **Framework:** React (Next.js)
- **State Management:** React Query
- **Styling:** Tailwind CSS
- **Canvas Handling:** HTML5 Canvas API
- **Real-Time Updates:** Liveblocks
- **Authentication & Org Management:** Clerk

### Key Frontend Features

#### 1. **Canvas Implementation**

- Utilizes the HTML5 Canvas API for drawing.
- Supports multiple layers to separate user strokes.
- Live synchronization of canvas state using **Liveblocks**.

#### Frontend UI Screenshots

![Home Page](https://res.cloudinary.com/dq8b6vgab/image/upload/v1743531887/Screenshot_2025-04-01_235203_zv8a8d.png)

![Loading Screen](https://res.cloudinary.com/dq8b6vgab/image/upload/v1743531887/Screenshot_2025-04-01_235148_jha9lv.png)

![Board Page](https://res.cloudinary.com/dq8b6vgab/image/upload/v1743531887/Screenshot_2025-04-01_235308_naqrhs.png)

#### 2. **Shape & Text Tools**

- Users can insert geometric shapes and text.
- Shapes and text can be moved, resized, and deleted.
- Implements a simple event-driven system to track user interactions.

#### 3. **Handwriting Capture and Processing**

- Extracts handwritten strokes as a **Blob image**.
- Sends image data to the backend API for processing.

#### 4. **Organization & Authentication**

- Uses **Clerk** for user authentication and organization management.
- Implements role-based access to ensure security.

#### 5. **Real-Time Board Sync**

- **Liveblocks** ensures all users see updates instantly.
- Optimized for minimal latency and smooth collaboration.

---

## Machine Learning Model Development

### Tech Stack

- **Model Training:** Python, TensorFlow, OpenCV
- **Dataset Used:** MNIST, CROHME (for mathematical symbols)
- **Backend Integration:** Flask/Node.js
- **Processing Library:** NumPy, Scikit-learn

### Model Architecture

- **CNN-based** architecture for handwriting recognition.
- Uses **LSTM layers** to improve sequence prediction for mathematical expressions.
- **Preprocessing:**
  - Converts raw handwritten input into grayscale.
  - Applies **Gaussian Blur** and **Thresholding** for noise reduction.
  - Segments characters for better recognition accuracy.

#### ML Model Architecture Diagram

![CNN + LSTM Model Architecture](https://res.cloudinary.com/dq8b6vgab/image/upload/v1743531874/download_ezr58n.png)

### Character Segmentation

The image below represents how character segmentation is performed before recognition:

![Character Segments and Their Positions](https://res.cloudinary.com/dq8b6vgab/image/upload/v1743531874/download_ezr58n.png)

![Character Segmentation](https://res.cloudinary.com/dq8b6vgab/image/upload/v1743531873/download_6_evqhqh.png)

![Character Segmentation](https://res.cloudinary.com/dq8b6vgab/image/upload/v1743531873/download_3_zsotgg.png)

![Character Segmentation](https://res.cloudinary.com/dq8b6vgab/image/upload/v1743531873/download_4_fq3w4u.png)

### Prediction Workflow

1. User writes a mathematical expression on the board.
2. The input is extracted as an image (Blob format).
3. Image undergoes preprocessing (grayscale conversion, thresholding, noise removal).
4. Segmentation extracts individual characters or symbols.
5. Each character is passed through the CNN model for prediction.
6. The recognized equation is reconstructed and displayed on the frontend.

#### Prediction Flow Diagram

![Prediction Flow](https://res.cloudinary.com/dq8b6vgab/image/upload/v1743531874/download_ezr58n.png)

### Deployment

- The model is deployed using **Flask API** for backend inference.
- Integrated with the frontend via REST API endpoints.
- TensorFlow Lite version optimized for faster inference.

---

## Makers

**BoardShare** was created by:

**Sanket Hanjari Rathod** - [Portfolio](https://sanketrathod.vercel.app)

---

## Live Demo

Check out the live version of BoardShare here: [BoardShare Live](https://boardshare.vercel.app)
