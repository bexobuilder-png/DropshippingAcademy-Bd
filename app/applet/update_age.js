const fs = require('fs');

// 1. DobField.tsx
let dobPath = 'src/components/DobField.tsx';
let dobContent = fs.readFileSync(dobPath, 'utf8');
dobContent = dobContent.replace(/young: "বয়স ন্যূনতম ১৮ বছর হতে হবে。"/g, 'young: "বয়স সর্বনিম্ন ১২ বছর হতে হবে।"');
dobContent = dobContent.replace(/young: "You must be at least 18 years old."/g, 'young: "You must be at least 12 years old."');
dobContent = dobContent.replace(/age < 18/g, 'age < 12');
dobContent = dobContent.replace(/age >= 18/g, 'age >= 12');
dobContent = dobContent.replace(/max\.getFullYear\(\) - 18/g, 'max.getFullYear() - 12');
fs.writeFileSync(dobPath, dobContent, 'utf8');
console.log('Updated DobField.tsx');

// 2. waitlist.ts schema
let waitlistPath = 'src/schemas/waitlist.ts';
let waitlistContent = fs.readFileSync(waitlistPath, 'utf8');
waitlistContent = waitlistContent.replace(/eighteenYearsAgo/g, 'twelveYearsAgo');
waitlistContent = waitlistContent.replace(/today\.getFullYear\(\) - 18/g, 'today.getFullYear() - 12');
waitlistContent = waitlistContent.replace(/You must be at least 18 years old to join the waitlist\./g, 'বয়স সর্বনিম্ন ১২ বছর হতে হবে। ১২ বছর ঊর্ধ্বে রেজিস্ট্রেশন করতে পারবে।');
waitlistContent = waitlistContent.replace(/You must be 18\+ to join\./g, 'বয়স সর্বনিম্ন ১২ বছর হতে হবে।');
fs.writeFileSync(waitlistPath, waitlistContent, 'utf8');
console.log('Updated waitlist.ts');

// 3. JoinWaitlistPage.tsx
let joinPath = 'src/pages/JoinWaitlistPage.tsx';
let joinContent = fs.readFileSync(joinPath, 'utf8');
joinContent = joinContent.replace(/বয়স ন্যূনতম ১৮ বছর হতে হবে।/g, 'বয়স সর্বনিম্ন ১২ বছর হতে হবে। ১২ বছর ঊর্ধ্বে রেজিস্ট্রেশন করতে পারবে।');
joinContent = joinContent.replace(/You must be at least 18\./g, 'Minimum age must be 12 years.');
fs.writeFileSync(joinPath, joinContent, 'utf8');
console.log('Updated JoinWaitlistPage.tsx');
