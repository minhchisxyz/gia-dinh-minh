import {Spinner} from "@/components/ui/spinner";

export default function LoadingAccountPage() {
  return (
      <div className="h-full overflow-y-auto bg-white flex justify-center items-center">
        <Spinner/>
      </div>
  )
}