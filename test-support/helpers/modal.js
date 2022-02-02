import wait from 'ember-test-helpers/wait';

import $ from 'jquery';

export function getModal(modalClass) {
  return $(`.modal.in${modalClass ? `.${modalClass}` : ''}`);
}

export function getModalHeader(modalClass) {
  return getModal(modalClass).find('.modal-header');
}

export function getModalBody(modalClass) {
  return getModal(modalClass).find('.modal-body');
}

export function getModalFooter(modalClass) {
  return getModal(modalClass).find('.modal-footer');
}

export function isModalOpened(modalClass) {
  return Boolean(getModal(modalClass).length);
}

export async function closeModalUsingBackground() {
  document.querySelector('.modal').click();
  return wait();
}
