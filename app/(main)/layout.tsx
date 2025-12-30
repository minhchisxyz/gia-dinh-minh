import {ReactNode} from "react";
import Navbar from "@/components/navbar";

export default function MainLayout(
    { children }: {
      children: ReactNode
    }
) {
  return (
      <div className={`flex flex-col h-screen overflow-hidden`}>
        <Navbar/>
        <main className={`flex-1 overflow-hidden`}>
          {children}
        </main>
      </div>
  )
}