import { triggerEvent } from '@ember/test-helpers';

/**
 *
 * @param {HTMLInputElement} input
 * @param {Array<{ name: string, content: string, mimeType: string }>} files
 */
export default async function triggerFileInputChange(input, files) {
  const dataTransfer = new DataTransfer();
  files.forEach(({ name, content, mimeType }) => {
    const contentBlob = new Blob([content], { type: mimeType });
    const fileObject = new File([contentBlob], name, { type: mimeType });
    dataTransfer.items.add(fileObject);
  });
  input.files = dataTransfer.files;
  await triggerEvent(input, 'change');
}
