import fs from "fs";
import path from "path";
import nodeMailer from "nodemailer";
import dotenv from "dotenv";
import Handlebars from "handlebars";
import chalk from "chalk";

dotenv.config();

async function main() {
    try {
        const email = process.env.EMAIL;
        const number = process.env.NUMBER;
        const cvFile = process.env.CV_FILE;

        const transporter = nodeMailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 587,
            secure: true,
            auth: {
                user: email,
                pass: process.env.PASSWORD,
            },
        });

        const html = fs.readFileSync(
            path.resolve("files/template.html"),
            "utf-8"
        );
        const template = Handlebars.compile(html);

        const replacements = {
            full_name: "Mahmoud Ibrahiam",
            email,
            number,
        };

        const htmlToSend = template(replacements);

        const textToSend = `Hello,\nI hope this email finds you well. My name is Mahmoud Ibrahiam, and I am excited to introduce myself as a frontend developer.\nI have gained a solid foundation in HTML, CSS, and JavaScript, along with practical experience in building responsive and visually appealing websites. I am proficient in utilizing modern frontend frameworks like React and have a strong desire to continue expanding my skill set with new technologies.\nThroughout my academic projects, I have honed my attention to detail, problem-solving skills, and ability to collaborate effectively within multidisciplinary teams. I understand the importance of clear communication and actively contribute to a positive and inclusive work environment.\nI have attached my resume for your review, which provides further details on my skills, projects, and educational background. I am available for an interview at your convenience, either in-person or via video conference.\nThank you for considering my application. I look forward to the possibility of joining your team and making a positive impact. If you have any questions or require any additional information, please feel free to reach out to me at ${email} or ${number}.\nBest regards,\nMahmoud Ibrahiam.`;

        const companies = JSON.parse(fs.readFileSync("emails.json", "utf-8"));

        for (const company of companies) {
            await transporter.sendMail({
                from: `Mahmoud Ibrahiam <${email}>`,
                to: company.email,
                subject: "Frontend Developer Position",
                text: textToSend,
                html: htmlToSend,
                attachments: [
                    {
                        filename: cvFile,
                        path: `./files/${cvFile}`,
                        contentType: "application/pdf",
                    },
                ],
            });
            console.log(
                chalk.green(`Email sented successfully to ${company.email}`)
            );
        }

        console.log(chalk.green("All emails sented successfully"));
    } catch (error) {
        console.log(error);
    }
}

main();
