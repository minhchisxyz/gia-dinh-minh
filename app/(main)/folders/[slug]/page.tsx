import {getFolder, getFolderPath} from "@/lib/actions/files";
import FolderPage from "@/components/folder-page";
import {Folder} from "@/lib/definitions";

export default async function Page(
    { params }: {
      params: Promise<{ slug: string }>
    }
) {
  const { slug } = await params
  const [folder, folderPath] = await Promise.all([getFolder(parseInt(slug)), getFolderPath(parseInt(slug))])
  return (
      <FolderPage folder={folder as Folder} folderPath={folderPath}/>
  );
}