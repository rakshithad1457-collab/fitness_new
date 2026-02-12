import '../styles/globals.css'

export const metadata = {
  title: 'FitMood - Your Personal Fitness Companion',
  description: 'Get personalized workouts and nutrition plans based on your mood and goals',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}