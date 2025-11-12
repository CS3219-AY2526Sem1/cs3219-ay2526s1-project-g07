import "./App.css";
import { Button } from "@/components/ui/button";

const App = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <Button variant="outline">Button</Button>
    </div>
  );
};

export default App;
