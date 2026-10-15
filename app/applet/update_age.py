import re

# 1. DobField.tsx
dob_path = 'src/components/DobField.tsx'
with open(dob_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'young:\s*"বয়স ন্যূনতম ১৮ বছর হতে হবে।"', 'young: "বয়স সর্বনিম্ন ১২ বছর হতে হবে।"', content)
content = re.sub(r'young:\s*"You must be at least 18 years old\."', 'young: "You must be at least 12 years old."', content)
content = content.replace('age < 18', 'age < 12')
content = content.replace('age >= 18', 'age >= 12')
content = content.replace('max.getFullYear() - 18', 'max.getFullYear() - 12')

with open(dob_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated DobField.tsx')

# 2. waitlist.ts
waitlist_path = 'src/schemas/waitlist.ts'
with open(waitlist_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('eighteenYearsAgo', 'twelveYearsAgo')
content = content.replace('today.getFullYear() - 18', 'today.getFullYear() - 12')
content = content.replace('You must be at least 18 years old to join the waitlist.', 'বয়স সর্বনিম্ন ১২ বছর হতে হবে। ১২ বছর ঊর্ধ্বে রেজিস্ট্রেশন করতে পারবে।')
content = content.replace('You must be 18+ to join.', 'বয়স সর্বনিম্ন ১২ বছর হতে হবে।')

with open(waitlist_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated waitlist.ts')

# 3. JoinWaitlistPage.tsx
join_path = 'src/pages/JoinWaitlistPage.tsx'
with open(join_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('বয়স ন্যূনতম ১৮ বছর হতে হবে।', 'বয়স সর্বনিম্ন ১২ বছর হতে হবে। ১২ বছর ঊর্ধ্বে রেজিস্ট্রেশন করতে পারবে।')
content = content.replace('You must be at least 18.', 'Minimum age must be 12 years.')

with open(join_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated JoinWaitlistPage.tsx')
