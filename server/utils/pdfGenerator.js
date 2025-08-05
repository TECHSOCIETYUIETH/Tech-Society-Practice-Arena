const PDFDocument = require('pdfkit');
const moment     = require('moment');

function generateSubmissionPDF(res, submission, assignment) {
  const doc = new PDFDocument({ margin: 50 });
  // response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${assignment.title.replace(/\s+/g,'_')}_${submission.student.name}.pdf"`
  );

  doc.pipe(res);

  // Header
  doc.fontSize(20).text(assignment.title, { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12)
     .text(`Student: ${submission.student.name} (${submission.student.email})`)
     .text(`Submitted: ${moment(submission.createdAt).format('YYYY-MM-DD HH:mm')}`)
     .text(`Score: ${submission.totalScore}`)
     .moveDown();

  // Each answer
  submission.answers.forEach((ans, i) => {
    doc.fontSize(14).text(`Q${i+1}: ${ans.question.content}`);
    doc.fontSize(12)
       .text(`Your Answer: ${Array.isArray(ans.answer) ? ans.answer.join(', ') : ans.answer}`)
       .text(`Correct: ${ans.isCorrect ? 'Yes' : 'No'}`)
       .text(`Score: ${ans.score}`)
       .moveDown();
  });

  doc.end();
}

module.exports = generateSubmissionPDF;
