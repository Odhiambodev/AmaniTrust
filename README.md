# AmaniTrust

AmaniTrust is a blockchain-backed digital identity and reputation platform designed for Kenya's informal sector. It helps people and groups build trust across Chama, Harambee, and microfinance use cases by combining KYC verification, payment behavior, and community reputation into a verifiable trust score.

## Goals

- Issue a portable digital identity wallet for unbanked users
- Build trust for Chama and Harambee groups
- Record trust events on a private blockchain ledger
- Integrate M-Pesa for contribution and repayment flows
- Support compliance with Kenya's Data Protection Act and ODPC guidance

## Stack

- Frontend: Next.js + React + Tailwind CSS + PWA support
- Backend: NestJS + TypeScript
- Database: PostgreSQL + Prisma
- Blockchain: Hyperledger Fabric / private ledger adapter
- Payments: Safaricom M-Pesa Daraja API
- Security: AES-256 encryption, JWT, OAuth2-ready patterns, HMAC hash lookups

## Quick start

```bash
npm install
cp .env.example .env
npm run docker:up
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

## Repository structure

```text
amanitrust/
├── apps/
│   ├── api/
│   └── web/
├── prisma/
├── .env.example
├── docker-compose.yml
├── package.json
└── README.md
```

## MVP features

- Phone OTP onboarding
- National ID KYC simulation with provider abstraction
- Chama / Harambee group management
- Trust score calculation
- Public verification status
- M-Pesa payment skeleton
- Trust event hashing to blockchain
- Admin audit and compliance logs

## Security notes

- Raw PII remains in encrypted PostgreSQL storage
- Blockchain stores only event hashes and pseudonymous references
- Consent records are required for KYC, trust scoring, and payment processing
- Public verification returns only trust status and score band, never private data

## License

MIT
