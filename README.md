# Kaizentek-Mid: Exit Interview System

---

## Project Overview

The **Kaizentek-Mid Exit Interview System** is a web application created as part of a CS 312 project to manage and
streamline the exit interview process. This system enables administrators to add, edit, and delete questions, evaluate
responses, and manage evaluations efficiently. It showcases the integration of client-side and server-side web
technologies using HTML, CSS, JavaScript, and PHP.

---

## Objectives

This project aims to:

- Utilize JavaScript and the Document Object Model (DOM) to dynamically generate web content on the client side.
- Apply PHP for server-side operations to process and handle data.
- Demonstrate a seamless integration of HTML, CSS, JavaScript, and PHP for a full-stack web application.

---

## Features

- **Add Questions**: Create new questions for the exit interview process.
- **Edit & Delete Questions**: Update or remove existing questions as needed.
- **Evaluate Responses**: Check and assess responses provided in the exit interviews.
- **View Evaluations**: Display stored evaluations with filtering and sorting options for easier management.
- **Login System**: Basic authentication for securing access to different user roles.

---

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://gitlab.com/2233692/KaizenTek.git
   ```

2. **Database Setup**:
    - Import `kaizentekmid.sql` into your SQL database to create the necessary tables and schema.

3. **Run the Application**:

### Note:

#### Student Access: Handled by PHP, students can log in, view, and submit evaluations.

- mqNavigate to the php directory

   ```bash 
   cd php
   ```

- Run the PHP server

   ```bash
   php -S localhost:8000 -t public
   ```
- Access the application through the specified port (e.g., http://localhost:8000 if your application is configured to
  run on port 8000).

#### Admin Access: Handled by Node.js, administrators can log in, manage questions, and evaluations.

To run a Node.js application, follow these steps:

1. Install Node.js:
    - Download and install Node.js from the official website.

2. Navigate to Your Project Directory:
    - Open a terminal or command prompt.
    - Change to the directory where your Node.js project is located.

   ```bash
    cd nodejs
   ```

3. Install Dependencies:
    - Ensure you have a package.json file in your project directory.
    - Run the following command to install all the dependencies listed in package.json:

   ```bash
   npm install
   ```

4. Start the Node.js Application:
    - Run the following command to start your Node.js application. This command assumes your entry point is index.js or
      is
      specified in the package.json file under the scripts section.
   ```bash
   node server.js
   ```

    - Alternatively, if you have a start script defined in your package.json, you can use:
   ```bash
   npm start
   ```
   Your Node.js application should now be running. You can access it through the specified port (
   e.g., http://localhost:3000 if your application is configured to run on port 3000).

---

## Contributors

- Aguilar, Aaron Kyle
- Lactaotao, Benny Gil A.
- Fortaleza, Keanu Sonn
- Octavo, Sean Drei 