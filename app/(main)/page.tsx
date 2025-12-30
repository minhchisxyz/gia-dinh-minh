import {getFolder, getFolderPath} from "@/lib/actions/files";

import FolderPage from "@/pages/folder-page";
import {Folder} from "@/lib/definitions";

export default async function Home() {
  const [mainFolder, folderPath] = await Promise.all([getFolder(), getFolderPath()])
  return (
      <FolderPage folder={mainFolder as Folder} folderPath={folderPath}/>
  );
}
