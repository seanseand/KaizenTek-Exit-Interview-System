const db = require('../config/db');

exports.getProgramStudentCounts = async () => {
    const query = `
        SELECT
            p.ProgramName,
            COUNT(s.StudentID) AS StudentCount
        FROM
            PROGRAM p
                LEFT JOIN
            STUDENT s ON p.ProgramID = s.ProgramID
        GROUP BY
            p.ProgramID, p.ProgramName
        ORDER BY
            StudentCount DESC;
    `;

    const [results] = await db.promise().query(query);
    return JSON.stringify(results);
};

exports.getEvaluationCounts = async () => {
    const query = `
        SELECT
            Status,
            COUNT(EvaluationID) AS EvaluationCount
        FROM
            EVALUATION
        GROUP BY
            Status
        ORDER BY
            FIELD(Status, 'Draft', 'Published', 'Finished'), EvaluationCount DESC;
    `;

    const [results] = await db.promise().query(query);
    return JSON.stringify(results);
};

exports.getResponseCounts = async () => {
    const query = `
        SELECT
            e.EvaluationID,
            e.Semester,
            e.ProgramID,
            p.ProgramName,
            COUNT(DISTINCT r.StudentID) AS Responses,
            COUNT(DISTINCT s.StudentID) AS ExpectedRespondents
        FROM
            EVALUATION e
                LEFT JOIN
            RESPONSE r ON e.EvaluationID = r.EvaluationID
                LEFT JOIN
            STUDENT s ON e.ProgramID = s.ProgramID
                LEFT JOIN
            PROGRAM p ON e.ProgramID = p.ProgramID
        GROUP BY
            e.EvaluationID, e.Semester, e.ProgramID, p.ProgramName
        ORDER BY
            e.Semester, p.ProgramName;
    `;

    const [results] = await db.promise().query(query);
    return JSON.stringify(results);
};