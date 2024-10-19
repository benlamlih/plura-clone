import { NextResponse } from "next/server";
import { OpenAI } from "openai";

export async function POST(req: Request) {
  try {
    const { pdfText } = await req.json(); // Receive the parsed PDF text in the request
    console.log("pdftext", pdfText);

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // Ensure your OpenAI API key is in the environment
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Here is the resume text:\n\n${pdfText}\n\nPlease extract the relevant information in the following JSON format:
          {
            "personal_info": {
              "name": "John Doe",
              "email": "john.doe@example.com",
              "phone": "+1-234-567-8901",
              "linkedin": "linkedin.com/in/johndoe",
              "location": "New York, USA"
            },
            "summary": "A brief summary of the candidate's profile...",
            "education": [
              {
                "degree": "Bachelor of Science in Computer Science",
                "institution": "MIT",
                "dates": "2015 – 2019",
                "grade": "3.8 GPA"
              }
            ],
            "work_experience": [
              {
                "job_title": "Software Engineer",
                "company": "Google",
                "dates": "2019 – Present",
                "responsibilities": "Worked on scalable web applications using Node.js..."
              }
            ],
            "skills": {
              "technical_skills": [
                "Python",
                "Java",
                "React",
                "AWS"
              ],
              "soft_skills": [
                "Teamwork",
                "Leadership",
                "Communication"
              ]
            },
            "certifications": [
              {
                "name": "AWS Certified Solutions Architect",
                "date": "2020"
              }
            ],
            "projects": [
              {
                "title": "E-commerce Website",
                "description": "Developed a full-stack e-commerce website using React...",
                "technologies": [
                  "Django",
                  "React",
                  "PostgreSQL"
                ]
              }
            ]
          }`,
        },
      ],
    });

    const result = response.choices[0].message?.content;
    console.log("result", result);
    console.log("pdf", pdfText);
    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process the request." },
      { status: 500 },
    );
  }
}
