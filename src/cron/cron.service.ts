import { probe } from '@network-utils/tcp-ping';
import { Injectable } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule/dist/enums';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ProjectMailer } from 'src/mailers';
import { Project } from 'src/project/entities';
import { CronJob } from 'cron';

enum MinibackCronJob {
  HealthCheckProjects = 'healthCheckProjects'
}

@Injectable()
export class CronService {
  constructor(
    private projectMailer: ProjectMailer,
    private schedulerRegistry: SchedulerRegistry
  ) {}

  private async checkServerPort(
    port: number,
    { email, projectName }: { email: string; projectName: string }
  ) {
    probe(port, 'localhost').catch(() => {
      this.projectMailer.sendServerBrokeDownMessage(email, projectName);
    });
  }

  private formJobName(taskDefinition: MinibackCronJob, taskPayload: string) {
    return taskDefinition + '-' + taskPayload;
  }

  public addCheckProjectHealthTask({ port, email, name }: Project) {
    const jobName = this.formJobName(MinibackCronJob.HealthCheckProjects, name);
    const currentJob = this.schedulerRegistry.getCronJob(jobName);
    if (currentJob) {
      currentJob.start();
    } else {
      const job = new CronJob(CronExpression.EVERY_5_MINUTES, () =>
        this.checkServerPort(Number(port), { email, projectName: name })
      );
      this.schedulerRegistry.addCronJob(jobName, job);
      job.start();
    }
  }

  public stopCheckProjectHealthTask({ name }: Project) {
    const jobName = this.formJobName(MinibackCronJob.HealthCheckProjects, name);
    const job = this.schedulerRegistry.getCronJob(jobName);
    job.stop();
  }

  public deleteCheckProjectHealthTask({ name }: Project) {
    const jobName = this.formJobName(MinibackCronJob.HealthCheckProjects, name);
    this.schedulerRegistry.deleteCronJob(jobName);
  }
}
