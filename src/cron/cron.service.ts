import { probe } from '@network-utils/tcp-ping';
import { Injectable } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule/dist/enums';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ProjectMailer } from 'src/mailers';
import { Project } from 'src/project/entities';
import { CronJob } from 'cron';
import { handleServiceErrors } from 'src/utils';

enum MinibackCronJob {
  HealthCheckProjects = 'healthCheckProjects'
}

@Injectable()
export class CronService {
  constructor(
    private projectMailer: ProjectMailer,
    private schedulerRegistry: SchedulerRegistry
  ) {}

  private formJobName(taskDefinition: MinibackCronJob, taskPayload: string) {
    return taskDefinition + '-' + taskPayload;
  }

  public addCheckProjectHealthTask(project: Project) {
    const { ports, email, name } = project;
    const jobName = this.formJobName(MinibackCronJob.HealthCheckProjects, name);

    try {
      const currentJob = this.schedulerRegistry.getCronJob(jobName);
      currentJob.start();
    } catch (err) {
      if (err.message && err.message.includes('No Cron Job was found')) {
        const job = new CronJob(CronExpression.EVERY_5_MINUTES, async () => {
          let allPortsListening = true;

          for (const port of ports) {
            try {
              await probe(port.port, 'localhost');
            } catch {
              allPortsListening = false;
              break;
            }
          }

          if (!allPortsListening) {
            await this.projectMailer.sendServerBrokeDownMessage(email, name);
          }
        });

        this.schedulerRegistry.addCronJob(jobName, job);
        job.start();
      } else {
        handleServiceErrors(err);
      }
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
