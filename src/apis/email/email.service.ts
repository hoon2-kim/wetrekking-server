import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
@Injectable()
export class EmailService {
  getToday() {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = date.getMonth() + 1;
    const dd = date.getDate();
    const result = `${yyyy}-${mm}-${dd}`;
    console.log(result);
    return result;
  }

  // 회원가입시 이메일 전송
  getWelcomeTemplate({ name, phone }) {
    const mytemplate = `
<html>
    <div style="display: flex; flex-direction: column; align-items: center;">
    <div width: 500px>
        <h1>[weTrekking] ${name}님 가입을 환영합니다!!!</h1>
        <hr />
        <div>
            <p style="font-size: 35px; font-weight:600; color:#111;">회원가입에 감사드립니다.</p>
            <p style="font-size:18px; font-weight:400; color:#111; line-height: 1.4;">회원가입 감사 <span style="font-weight: 700; text-decoration: underline; color:#2F4B2A;">1000P</span>를 지급해드렸으니<br/>
            지금바로 크루를 모집해보세요!!</p>
            <a href="https://wetrekking.kr/" style="font-size: 30px; text-decoration: none; font-weight: 500; color: #2F4B2A;"> 크루 모집하러 가기 ></a>
        </div>
        <hr />
        <div style="padding: 10px;">
            <div style="margin-bottom: 8px; font-size: 20px;">이름: ${name}</div>
        <div style=" margin-bottom: 8px; font-size: 20px;">핸드폰: ${phone}</div>
        <div style="margin-bottom: 30px; font-size: 20px;">가입일: ${this.getToday()}</div>

        </div>

    </div>
    </div>
</html>`;

    return mytemplate;
  }

  // 방장한테 신청자 nickname을 이메일로 전송
  getApplyTemplate({ nickname, crewBoardTitle }) {
    const mytemplate = `
    <html>
    <div style="display: flex; flex-direction: column; align-items: center;">
    <div width: 500px>
        <h1>[weTrekking] ${crewBoardTitle} 게시글에 신청자가 있습니다!!</h1>
        <hr />
        <div style="padding: 10px;">
            <div style="margin-bottom: 20px; font-size: 18px;"> ${nickname}님께서 ${crewBoardTitle} 게시글을 신청하였습니다. 새로운 크루원을 확인해 보세요.  </div>
            <a href="https://wetrekking.kr/" style="font-size: 30px; text-decoration: none; font-weight: 500; color: #2F4B2A;">위트레킹 바로가기 ></a>
        </div>

    </div>
    </div>
</html>
`;

    return mytemplate;
  }

  // 신청자 수락 이메일로 전송
  getAcceptTemplate({ nickname, crewBoardTitle }) {
    const mytemplate = `
    <html>
    <div style="display: flex; flex-direction: column; align-items: center;">
    <div width: 500px>
        <h1>[weTrekking] ${nickname}님, ${crewBoardTitle}게시글에 수락되었습니다!!</h1>
        <hr />
        <div style="padding: 10px;">
            <div style="margin-bottom: 20px; font-size: 18px;"> ${crewBoardTitle}게시글에 새로운 크루원이 되었습니다. </div>
            <a href="https://wetrekking.kr/" style="font-size: 30px; text-decoration: none; font-weight: 500; color: #2F4B2A;">위트레킹 바로가기 ></a>
        </div>
    </div>
</html>
`;

    return mytemplate;
  }
  // 신청자 거절 이메일로 전송
  getRejectTemplate({ nickname, crewBoardTitle }) {
    const mytemplate = `
        <html>
        <div style="display: flex; flex-direction: column; align-items: center;">
        <div width: 500px>
            <h1>[weTrekking] ${nickname}님, ${crewBoardTitle}게시글에 거절되었습니다!!</h1>
            <hr />
            <div style="padding: 10px;">
                <div style="margin-bottom: 20px; font-size: 18px;"> 새로운 크루 게시글을 찾아보세요. </div>
                <a href="https://wetrekking.kr/" style="font-size: 30px; text-decoration: none; font-weight: 500; color: #2F4B2A;">위트레킹 바로가기 ></a>
            </div>
        </div>
    </html>
    `;
    console.log(mytemplate);
    return mytemplate;
  }

  // 임시 비밀번호  이메일로 전송
  getPasswordTemplate({ name, randomPassword }) {
    const mytemplate = `
          <html>
          <div style="display: flex; flex-direction: column; align-items: center;">
          <div width: 500px>
              <h1>[weTrekking] ${name}님, 임시 비밀번호가 발급되었습니다!!</h1>
              <hr />
              <div style="padding: 10px;">
                  <div style="margin-bottom: 20px; font-size: 18px;">임시 비밀번호는 ${randomPassword} 입니다. </div>
                  <a href="https://wetrekking.kr/login" style="font-size: 30px; text-decoration: none; font-weight: 500; color: #2F4B2A;">위트레킹 바로가기 ></a>
              </div>
          </div>
      </html>
      `;
    console.log(mytemplate);
    return mytemplate;
  }

  async sendTemplateToEmail({ email, result, comment }) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const response = await transporter
      .sendMail({
        from: process.env.EMAIL_SENDER,
        to: email,
        subject: `${comment}`,
        html: result,
      })
      .catch((err) => {
        console.log(err);
      });
    console.log(response);
  }
}
