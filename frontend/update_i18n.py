import re

with open('src/lib/i18n.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'mrnPlaceholder: "उदा. MRN-10293",',
    'mrnPlaceholder: "उदा. MRN-10293",\n    abhaLabel: "ABHA Number (Optional)",\n    abhaPlaceholder: "e.g. 91-xxxx-xxxx-xxxx",\n    mockAbhaBtn: "Mock Verify ABHA",'
)
content = content.replace(
    'mrnPlaceholder: "ಉದಾ. MRN-10293",',
    'mrnPlaceholder: "ಉದಾ. MRN-10293",\n    abhaLabel: "ABHA Number (Optional)",\n    abhaPlaceholder: "e.g. 91-xxxx-xxxx-xxxx",\n    mockAbhaBtn: "Mock Verify ABHA",'
)

with open('src/lib/i18n.ts', 'w', encoding='utf-8') as f:
    f.write(content)
