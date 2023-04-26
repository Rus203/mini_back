import { probe } from '@network-utils/tcp-ping';
import { Injectable } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule/dist/enums';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ProjectMailer } from 'src/mailers';
import { Project } from 'src/project/entities';
import { CronJob } from 'cron';
import { handleServiceErrors } from 'src/utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

enum MinibackCronJob {
  HealthCheckProjects = 'healthCheckProjects'
}

@Injectable()
export class CronService {
  constructor(
    private projectMailer: ProjectMailer,
    private schedulerRegistry: SchedulerRegistry,
    @InjectRepository(Project) private projectsRepository: Repository<Project>
  ) {}

  private async checkServerPort(
    port: number,
    { email, projectName }: { email: string; projectName: string }
  ) {
    probe(port, 'localhost').catch(async () => {
      await this.projectMailer.sendServerBrokeDownMessage(email, projectName);
      await this.projectsRepository.update(
        { name: projectName },
        { isDeployed: false }
      );
    });
  }

  private formJobName(taskDefinition: MinibackCronJob, taskPayload: string) {
    return taskDefinition + '-' + taskPayload;
  }

  public addCheckProjectHealthTask({ port, email, name }: Project) {
    const jobName = this.formJobName(MinibackCronJob.HealthCheckProjects, name);

    try {
      const currentJob = this.schedulerRegistry.getCronJob(jobName);
      currentJob.start();
    } catch (err) {
      if (err.message && err.message.includes('No Cron Job was found')) {
        const job = new CronJob(CronExpression.EVERY_5_MINUTES, () =>
          this.checkServerPort(Number(port), { email, projectName: name })
        );
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
