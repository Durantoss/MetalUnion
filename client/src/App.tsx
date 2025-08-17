import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import Test from "./test";

function Router() {
  console.log("App Router is rendering"); // Debug log
  return <Test />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* <Toaster /> */}
      <Router />
    </QueryClientProvider>
  );
}

export default App;
