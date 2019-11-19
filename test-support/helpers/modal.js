import $ from 'jquery';

export function getModal() {
  return $('.modal.in');
}

export function getModalHeader() {
  return getModal().find('.modal-header');
}

export function getModalBody() {
  return getModal().find('.modal-body');
}

export function getModalFooter() {
  return getModal().find('.modal-footer');
}

export function isModalOpened() {
  return Boolean(getModal().length);
}
