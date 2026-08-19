CREATE TABLE `admission_enquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicantName` varchar(160) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`email` varchar(320),
	`trade` enum('Fitter','Electrician') NOT NULL,
	`qualification` varchar(120),
	`message` text,
	`status` enum('new','contacted','closed') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admission_enquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actor` varchar(160) NOT NULL,
	`actorRole` varchar(40) NOT NULL,
	`action` varchar(120) NOT NULL,
	`entity` varchar(120),
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
