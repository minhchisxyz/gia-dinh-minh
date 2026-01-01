import {getFolder, getFolderPath} from "@/lib/actions/files"
import FolderPage from "@/components/folder-page"
import {Folder} from "@/lib/definitions"
import {auth} from "@/auth"
export default async function Home() {
  const session = await auth()
  const [mainFolder, folderPath] = await Promise.all([getFolder(), getFolderPath()])
  return (
      <FolderPage folder={mainFolder as Folder} folderPath={folderPath} currentUserId={session?.user?.id ? parseInt(session.user.id) : undefined}/>
  )
}
