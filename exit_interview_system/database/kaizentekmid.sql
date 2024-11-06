-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Nov 03, 2024 at 07:25 AM
-- Server version: 8.2.0
-- PHP Version: 8.2.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kaizentekmid`
--

-- --------------------------------------------------------

--
-- Table structure for table `answer`
--

DROP TABLE IF EXISTS `answer`;
CREATE TABLE IF NOT EXISTS `answer` (
  `AnswerID` int NOT NULL AUTO_INCREMENT,
  `EvaluationID` int NOT NULL,
  `QuestionID` int NOT NULL,
  `Answer` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `DateAnswered` date NOT NULL,
  PRIMARY KEY (`AnswerID`),
  KEY `evaluationID` (`EvaluationID`),
  KEY `questionID` (`QuestionID`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Dumping data for table `answer`
--

INSERT INTO `answer` (`AnswerID`, `EvaluationID`, `QuestionID`, `Answer`, `DateAnswered`) VALUES
(1, 1, 1, 'True', '2024-08-02'),
(2, 1, 2, 'False', '2024-08-02'),
(3, 1, 3, 'True', '2024-08-02'),
(4, 2, 1, 'True', '2024-09-02'),
(5, 2, 2, 'True', '2024-09-02'),
(6, 2, 3, 'True', '2024-09-02'),
(7, 3, 1, 'False', '2024-10-02'),
(8, 3, 2, 'True', '2024-10-02'),
(9, 3, 3, 'True', '2024-10-02');

-- --------------------------------------------------------

--
-- Table structure for table `evaluation`
--

DROP TABLE IF EXISTS `evaluation`;
CREATE TABLE IF NOT EXISTS `evaluation` (
  `EvaluationID` int NOT NULL AUTO_INCREMENT,
  `EvaluationName` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `ProgramID` int NOT NULL,
  `Semester` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `Status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'Ongoing',
  PRIMARY KEY (`EvaluationID`),
  UNIQUE KEY `EvaluationName` (`EvaluationName`),
  KEY `evaluation_ibfk_1` (`ProgramID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Dumping data for table `evaluation`
--

INSERT INTO `evaluation` (`EvaluationID`, `EvaluationName`, `ProgramID`, `Semester`, `StartDate`, `EndDate`, `Status`) VALUES
(1, 'BSCS\' Eval', 1, 'First', '2024-08-01', '2024-08-03', 'Finished'),
(2, 'BSA\'s Eval', 2, 'First', '2024-09-01', '2024-09-03', 'Finished'),
(3, 'BSMA\'s Eval', 3, 'First', '2024-10-01', '2024-10-03', 'Finished');

-- --------------------------------------------------------

--
-- Table structure for table `link`
--

DROP TABLE IF EXISTS `link`;
CREATE TABLE IF NOT EXISTS `link` (
  `EvaluationID` int NOT NULL,
  `QuestionID` int NOT NULL,
  PRIMARY KEY (`EvaluationID`,`QuestionID`),
  KEY `evaluationID` (`EvaluationID`),
  KEY `link_ibfk_2` (`QuestionID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Dumping data for table `link`
--

INSERT INTO `link` (`EvaluationID`, `QuestionID`) VALUES
(1, 1),
(1, 2),
(1, 3),
(2, 1),
(2, 2),
(2, 3),
(3, 1),
(3, 2),
(3, 3);

-- --------------------------------------------------------

--
-- Table structure for table `program`
--

DROP TABLE IF EXISTS `program`;
CREATE TABLE IF NOT EXISTS `program` (
  `ProgramID` int NOT NULL AUTO_INCREMENT,
  `ProgramName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`ProgramID`),
  UNIQUE KEY `ProgramName` (`ProgramName`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Dumping data for table `program`
--

INSERT INTO `program` (`ProgramID`, `ProgramName`) VALUES
(2, 'BSA'),
(1, 'BSCS'),
(4, 'BSE'),
(8, 'BSFM'),
(10, 'BSHM'),
(7, 'BSIT'),
(3, 'BSMA'),
(9, 'BSMM'),
(6, 'BSMMA'),
(5, 'BSTM');

-- --------------------------------------------------------

--
-- Table structure for table `question`
--

DROP TABLE IF EXISTS `question`;
CREATE TABLE IF NOT EXISTS `question` (
  `QuestionID` int NOT NULL AUTO_INCREMENT,
  `QuestionDesc` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `QuestionType` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `CreatorID` int NOT NULL,
  PRIMARY KEY (`QuestionID`),
  KEY `creatorID` (`CreatorID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Dumping data for table `question`
--

INSERT INTO `question` (`QuestionID`, `QuestionDesc`, `QuestionType`, `CreatorID`) VALUES
(1, 'The program/course met my expectations.', 'TrueOrFalse', 1),
(2, 'The course content was easy to understand.', 'TrueOrFalse', 1),
(3, 'The professor was an effective teacher.', 'TrueOrFalse', 6);

-- --------------------------------------------------------

--
-- Table structure for table `response`
--

DROP TABLE IF EXISTS `response`;
CREATE TABLE IF NOT EXISTS `response` (
  `StudentID` int NOT NULL,
  `EvaluationID` int NOT NULL,
  PRIMARY KEY (`StudentID`,`EvaluationID`),
  KEY `studentID` (`StudentID`),
  KEY `evaluationID` (`EvaluationID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Dumping data for table `response`
--

INSERT INTO `response` (`StudentID`, `EvaluationID`) VALUES
(2, 1),
(3, 2),
(4, 3);

-- --------------------------------------------------------

--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
CREATE TABLE IF NOT EXISTS `student` (
  `StudentID` int NOT NULL,
  `ProgramID` int NOT NULL,
  PRIMARY KEY (`StudentID`),
  KEY `student_ibfk_2` (`ProgramID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Dumping data for table `student`
--

INSERT INTO `student` (`StudentID`, `ProgramID`) VALUES
(2, 1),
(3, 2),
(4, 3),
(5, 4),
(7, 5),
(8, 6),
(9, 7);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `Username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `LastName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `FirstName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `Email` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `Password` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `UserType` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Username` (`Username`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`UserID`, `Username`, `LastName`, `FirstName`, `Email`, `Password`, `UserType`) VALUES
(1, 'Eydala', 'Aguilar', 'Aaron', '2233692@slu.edu.ph', '123', 'Admin'),
(2, 'Boogle', 'Mercado', 'Kyle', '2247564@slu.edu.ph', '123', 'Student'),
(3, 'Bini Tin', 'Lactaotao', 'Benny', '2246574@slu.edu.ph', '456', 'Student'),
(4, 'Zhectrix', 'Fortaleza', 'Keanu', '2247587@slu.edu.ph', '1235s', 'Student'),
(5, 'October', 'Octavo', 'Sean', '2247592@slu.edu.ph', '129ujdj', 'Student'),
(6, 'Yeoreum', 'Simon', 'Andrei', '2237686@slu.edu.ph', 'cotton', 'Admin'),
(7, 'Xajik', 'Alberto', 'Sean', '2247575@slu.edu.ph', '123353', 'Student'),
(8, 'Big Dong', 'Quirante', 'Julian', '2249898@slu.edu.ph', 'smurf', 'Student'),
(9, 'TheGoat', 'Suman', 'Marawi', '2248584@slu.edu.ph', '2169', 'Student');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `answer`
--
ALTER TABLE `answer`
  ADD CONSTRAINT `answer_ibfk_1` FOREIGN KEY (`EvaluationID`) REFERENCES `evaluation` (`EvaluationID`),
  ADD CONSTRAINT `answer_ibfk_2` FOREIGN KEY (`QuestionID`) REFERENCES `question` (`QuestionID`);

--
-- Constraints for table `evaluation`
--
ALTER TABLE `evaluation`
  ADD CONSTRAINT `evaluation_ibfk_1` FOREIGN KEY (`ProgramID`) REFERENCES `program` (`ProgramID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `link`
--
ALTER TABLE `link`
  ADD CONSTRAINT `link_ibfk_1` FOREIGN KEY (`EvaluationID`) REFERENCES `evaluation` (`EvaluationID`),
  ADD CONSTRAINT `link_ibfk_2` FOREIGN KEY (`QuestionID`) REFERENCES `question` (`QuestionID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `question`
--
ALTER TABLE `question`
  ADD CONSTRAINT `question_ibfk_1` FOREIGN KEY (`CreatorID`) REFERENCES `user` (`UserID`);

--
-- Constraints for table `response`
--
ALTER TABLE `response`
  ADD CONSTRAINT `response_ibfk_1` FOREIGN KEY (`StudentID`) REFERENCES `student` (`StudentID`),
  ADD CONSTRAINT `response_ibfk_2` FOREIGN KEY (`EvaluationID`) REFERENCES `evaluation` (`EvaluationID`);

--
-- Constraints for table `student`
--
ALTER TABLE `student`
  ADD CONSTRAINT `student_ibfk_1` FOREIGN KEY (`StudentID`) REFERENCES `user` (`UserID`),
  ADD CONSTRAINT `student_ibfk_2` FOREIGN KEY (`ProgramID`) REFERENCES `program` (`ProgramID`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
