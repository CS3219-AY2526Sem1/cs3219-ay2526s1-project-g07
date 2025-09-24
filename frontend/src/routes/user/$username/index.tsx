import Navbar from '@/src/components/Navbar'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$username/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <Navbar />
      hello
      
    </>
  )
}
