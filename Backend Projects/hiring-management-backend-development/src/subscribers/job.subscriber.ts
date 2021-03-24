// import { InternalServerErrorException } from "@nestjs/common";
// import { JobInterviewers } from "src/entities/job-interviewers.entity";
// import { Jobs } from "src/entities/job-posting.entity";
// // import { Panelist } from "src/entities/panelist.entity";
// import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from "typeorm";

// @EventSubscriber()
// export class JobSubscriber implements EntitySubscriberInterface<JobInterviewers> {


//     listenTo() {
//         return JobInterviewers;
//     }

//     async afterInsert(event: InsertEvent<JobInterviewers>) {
//         const jobInterviewers = await event.manager.getRepository(JobInterviewers).createQueryBuilder('interviewSlots')
//                                                     .select("MAX(interviewSlots.round)", "max")
//                                                     .where('interviewSlots.id = :id', {id: event.entity.id})
//                                                     .getRawOne();

//         const job = await event.manager.findOne(Jobs, {
//                     where: {id: event.entity.jobs.id}
//                     });

//         if(jobInterviewers) {
//            job.roundCount=jobInterviewers.max;
//         } 
//         try{
//             await event.manager.save(job);             
//         }catch(error){
//             throw new InternalServerErrorException(error);
//         }                                         
//     }

//     async afterUpdate(event: UpdateEvent<JobInterviewers>) {
//         const jobInterviewers = await event.manager.getRepository(JobInterviewers).createQueryBuilder('interviewSlots')
//                                                     .select("MAX(interviewSlots.round)", "max")
//                                                     .where('interviewSlots.id = :id', {id: event.entity.id})
//                                                     .getRawOne();

//         const job = await event.manager.findOne(Jobs, {
//                     where: {id: event.entity.jobs.id}
//                     });

//         if(jobInterviewers) {
//            job.roundCount=jobInterviewers.max;
//         } 
//         try{
//             await event.manager.save(job);             
//         }catch(error){
//             throw new InternalServerErrorException(error);
//         }                                        
//     }
    
//     // afterTransactionCommit(event: UpdateEvent<JobInterviewers>) {
//     //     console.log(`AFTER TRANSACTION STARTED: `, event);
//     // }
// }