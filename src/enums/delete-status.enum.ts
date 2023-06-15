export enum DeleteStatus {
  START = 0,
  STOP_DOCKER = 0.25,
  STOP_CRON_TASK = 0.5,
  REMOVE_TRASH = 0.75,
  FINISH = 1
}
