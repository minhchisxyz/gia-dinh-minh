ALTER TABLE "Comment"
    ADD CONSTRAINT "Comment_file_or_folder_check"
        CHECK (
            ("fileId" IS NOT NULL AND "folderId" IS NULL) OR
            ("fileId" IS NULL AND "folderId" IS NOT NULL)
            );
