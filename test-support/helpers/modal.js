import { click } from '@ember/test-helpers';

export function getModal(modalClass) {
  return document.querySelector(`.modal.in${modalClass ? `.${modalClass}` : ''}`);
}

export function getModalHeader(modalClass) {
  const modal = getModal(modalClass);
  return modal ? modal.querySelector('.modal-header') : modal;
}

export function getModalBody(modalClass) {
  const modal = getModal(modalClass);
  return modal ? modal.querySelector('.modal-body') : modal;
}

export function getModalFooter(modalClass) {
  const modal = getModal(modalClass);
  return modal ? modal.querySelector('.modal-footer') : modal;
}

export function isModalOpened(modalClass) {
  return Boolean(getModal(modalClass));
}

export async function closeModalUsingBackground() {
  await click(document.querySelector('.modal'));
}
