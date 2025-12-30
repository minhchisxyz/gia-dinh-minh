import {ReactNode} from "react";
import Navbar from "@/components/navbar";

export default function MainLayout(
    { children }: {
      children: ReactNode
    }
) {
  return (
      <div>
        <Navbar/>
        <main>
          {children}
        </main>
      </div>
  )
}