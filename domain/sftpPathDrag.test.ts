import assert from "node:assert/strict";
import test from "node:test";

import {
  areSftpDragPathsSafe,
  buildSftpPathInsertText,
  decodeSftpPathDragPayload,
  encodeSftpPathDragPayload,
  quoteShellPath,
} from "./sftpPathDrag";

test("SFTP drag payload preserves paths containing newlines", () => {
  const path = "/srv/it's\nfile.txt";
  const payload = decodeSftpPathDragPayload(encodeSftpPathDragPayload("host-1", [path]));
  assert.deepEqual(payload, { v: 1, hostId: "host-1", paths: [path] });
  assert.equal(buildSftpPathInsertText([path]), "'/srv/it'\\''s\nfile.txt' ");
});

test("SFTP drag paths reject interactive control bytes", () => {
  assert.equal(areSftpDragPathsSafe(["/srv/file\tdrop"]), false);
  assert.equal(areSftpDragPathsSafe(["/srv/file\u001bdrop"]), false);
  assert.equal(areSftpDragPathsSafe(["/srv/file.txt"]), true);
});

test("SFTP paths use the active shell quoting rules", () => {
  assert.equal(quoteShellPath("C:\\work\\it's & file.txt", "powershell"), "'C:\\work\\it''s & file.txt'");
  assert.equal(quoteShellPath("C:\\work\\a^b.txt", "cmd"), '"C:\\work\\a^^b.txt"');
  assert.equal(buildSftpPathInsertText(["/tmp/a b", "/tmp/it's"], "posix"), "'/tmp/a b' '/tmp/it'\\''s' ");
});
