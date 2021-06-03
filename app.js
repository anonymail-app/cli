const inquirer = require('inquirer');
const colors = require('colors');
const prompts = require('prompts');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const fs = require('fs');
const { v4 } = require('uuid');
const path = require('path');
require('dotenv/config');

console.log(`
 Anonymail-CLI V1: process started.
 Press CTRL+C to exit anytime.
 `);

inquirer
  .prompt([
    {
      name: 'to',
      message: 'To:',
      validate: async input => {
        if (input.trim() === '') {
          return 'No recipient added!';
        }
        return true;
      }
    },
    {
      name: 'cc',
      message: 'CC:'
    },
    {
      name: 'subject',
      message: 'Subject:'
    },
    {
      name: 'message',
      message: 'Compose:'
    },
    {
      name: 'backup',
      message: 'Create Backup? (y/n)'
    }
  ])
  .then(answers => {

    const transporter = nodemailer.createTransport(smtpTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      auth: {
        user: process.env.ACCOUNT,
        pass: process.env.PASSWORD
      }
    }));

    const to = answers.to.trim();
    const cc = answers.cc.trim();
    const subject = answers.subject;
    const message = answers.message;
    const backup = answers.backup;

    const mailOptions = {
      from: '"Anonymail" node.anonymail@gmail.com',
      to: to,
      cc: cc,
      subject: subject + ' - Anonymail',
      text: message + '\nThis message was was sent using Anonymail.'
    };

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log(colors.green('Mail sent!'));
      }
    });

    const format = `To: ${to}, \nCC: ${cc}, \nSubject: ${subject}, \n\n${message}`;

    if (backup === 'Y' || backup === 'y') {
      const filename = to + '.' + v4() + '.txt';
      fs.writeFileSync(path.resolve(__dirname, 'backup', filename), format);
      console.log(
        'Backup generated at' + path.resolve(__dirname, 'backup', filename)
      );
    } else {
      console.log('No backup created! Hope you have good memory.');
    }
  });
