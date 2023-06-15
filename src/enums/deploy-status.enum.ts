export enum DeployStatus {
  START = 0,
  PREPARING = 0.1,
  CHECKING = 0.3,
  RUN_DOCKER = 0.5,
  ADD_CRON_TASK = 0.8,
  FINISH = 1
}
