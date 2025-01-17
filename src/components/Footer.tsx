import { ConnectionStatus } from './ConnectionStatus'

export function Footer() {
  return (
    <footer className="bg-gray-100 py-4 mt-8">
      <div className="container mx-auto px-4">
        <ConnectionStatus />
        <p className="text-center text-gray-600 mt-4">&copy; 2023 WATCH. All rights reserved.</p>
      </div>
    </footer>
  )
}

