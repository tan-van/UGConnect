# UGConnect

UGConnect is a professional networking platform designed to connect creators and brands looking for User Generated Content to promote their products.

## Features

- User Authentication (Creators & Clients)
- Creator Profiles with Social Media Integration
- Job Listings Management
- Creator Spotlight Section
- Rating and Review System
- Premium Job Listings
- Dynamic Creator Discovery

## Tech Stack

- **Frontend**: React with TypeScript
- **Backend**: Node.js/Express
- **Database**: PostgreSQL
- **ORM**: Drizzle
- **API Management**: React Query
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file with the required database configuration
   - Ensure PostgreSQL is running and accessible

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
├── client/            # Frontend React application
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── lib/
├── server/           # Backend Express server
│   ├── routes.ts
│   └── auth.ts
├── db/              # Database schemas and configurations
└── public/          # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
