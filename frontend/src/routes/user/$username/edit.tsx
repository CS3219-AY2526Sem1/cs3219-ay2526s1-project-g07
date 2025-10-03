import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$username/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/user/$username/edit"!</div>
}
