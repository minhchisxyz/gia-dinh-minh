import {getFolder, getFolderPath} from "@/lib/actions/files";
import FolderPage from "@/components/folder-page";
import {Folder} from "@/lib/definitions";
import {auth} from "@/auth";

export default async function Page(
    { params }: {
      params: Promise<{ slug: string }>
    }
) {
  const session = await auth()
  const { slug } = await params
  const [folder, folderPath] = await Promise.all([getFolder(parseInt(slug)), getFolderPath(parseInt(slug))])
  return (
      <FolderPage folder={folder as Folder} folderPath={folderPath} currentUserId={session?.user?.id ? parseInt(session.user.id) : undefined}/>
  );
}