import jwt from 'jsonwebtoken';

const token = jwt.sign({ id: 'test', email: 'test@example.com' }, 'super_secret_jwt_key_for_development');

fetch('http://localhost:3001/api/draft', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': `accessToken=${token}`
  },
  body: JSON.stringify({
    scholarshipId: "1", // Needs to match SCHOLARSHIPS.find(s => s.id === scholarshipId)
    studentProfile: {
      firstName: "Test",
      major: "CS",
      gpa: 4.0,
      extracurriculars: ["Math"],
      demographics: ["Female"]
    }
  })
}).then(async res => {
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text);
}).catch(console.error);
