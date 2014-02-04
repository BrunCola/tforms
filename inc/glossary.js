var glossary = {

	'[CnC] Shadowserver': "The Shadowserver Foundation gathers intelligence on the darker side of the internet with a mission to understand and help put a stop to high stakes cybercrime in the information age."+
		"CnC servers are central points used for the control of botnets. Bots will usually report back in some way, often via IRC or other simple messaging protocols, once a new system is infected, and will then receive commands from the central server."+
		"Many forms of bot join dedicated chat sessions run on the C&C server, posting updates on their status and listening out for keywords which spark specific actions, such as sending out spam emails or downloading updated versions of their own code. Harvested data such as email address lists and banking details may also be posted to the C&C server, from where the botmaster can gather them and use them for further spamming and fraud."+
		"Recently more sophisticated botnets have begun using dstributed control systems, communicating information and commands peer-to-peer to avoid the vulnerable single-point-of-failure represented by the C&C server.",

	'[CnC] SpyEye': "The SpyEye Collector is a part of the SpyEye botnet controller. It is a daemon that listens on a specific port (mostly 443) and collecting stolen data from bots that are "+
		"connecting to it. The infected computers (bots) are using a TCP based protocol called Sausages to communicate with the Collector. The protocol is using encryption and LZO-compression."+
		"<br />The SpyEye Backconnect is a part of the SpyEye botnet controller. It is a daemon that listens on a specific port (common ports are 443, 3000-3005 and 7000-7005). Using SpyEye "+
		"Backconnect daemon, the criminal is able to access infected computers (bots), either to control them directly (RDP), proxy traffic through them (socks5) or to store/receive data (FTP).",

	'[CnC] Zeus': "ZeuS (also known as Zbot / WSNPoem) is a crimeware kit, which steals credentials from various online services like social networks, online banking accounts, ftp accounts, email "+
		"accounts and other (phishing).  Zeus can capture credentials out of HTTP-, HTTPS-, FTP- and POP3-traffic or out of the bot's protected storage (PStore). <br /> The ZeuS trojan spreads on "+
		"email as well via drive-by infections (using toolkits like LuckySploit, El fiesta and so on). It's the decision of the cybercriminal how he would like to distribute the binary.",

	'AlienVaultRedOctober': "On January 14, 2013 Kaspersky Lab announced that discovery of Red October, a high-level cyber-espionage campaign that has been active for over 5 years. "+
		"The campaign has successfully infiltrated computer networks at diplomatic, governmental and scientific research organizations, gathering data and intelligence from mobile devices, "+
		"computer systems and network equipment.",

	'Canadian Cyber Incident Response Centre (CCIRC)': "CCIRC helps ensure that many of the services which Canadians rely on daily are secure. It assists in securing the vital cyber "+
		"systems of provinces, territories, municipalities and private sector organizations while collaborating closely with partners, including international counterparts and "+
		"information technology vendors. ",

	'CINS Poor Reputation IP': "As our base of Sentinel IPS units has grown, we've come to realize that the attack data we gather has significant value, both to our own customers and to the community "+
		"at large. Collective Intelligence Network Security (CINS) is our attempt to use this information to significantly improve the security of our customers' networks and provide "+
		"valuable information to the InfoSec community. <br />Our CINS system is constantly gathering attack data from each of our Sentinel units in the field. This data is used to "+
		"calculate a CINS Score for every IP that is flagged by our system. Much like a FICO score is meant to show you at a glance the quality of your credit, "+
		"the CINS Score is designed to show you the quality - the trustworthyness - of an IP address. In addition, the IP's WHOIS information, country of origin, and the nature, "+
		"frequency, and breadth of its attacks across the Sentinel network are listed with the score. This level of detail is hard to replicate without an existing network like the Sentinels', "+
		"and we believe this information adds tremendous value to our customers.  We don't only trust ourselves to produce these scores. There are many great resources out there with "+
		"information about IP addresses. We tap in to some of the most popular sources, such as Emerging Threats, ShadowServer, Dshield and abuse.ch. We believe that combining the "+
		"information from these sources with our own attack data provides a more accurate overall assessment of an IP than a single source alone.  CINS Scores are easily accessible "+
		"from many access points on a Sentinel IPS web interface, and they are invaluable in helping our customers determine the nature and severity of the attacks they see.",

	'Compromised Host': "IP addresses "

	'Command and Control': "CnC servers are central points used for the control of botnets. Bots will usually report back in some way, often via IRC or other simple messaging protocols, "+
		"once a new system is infected, and will then receive commands from the central server. <br /> Many forms of bot join dedicated chat sessions run on the C&C server, posting "+
		"updates on their status and listening out for keywords which spark specific actions, such as sending out spam emails or downloading updated versions of their own code. "+
		"Harvested data such as email address lists and banking details may also be posted to the C&C server, from where the botmaster can gather them and use them for further "+
		"spamming and fraud. <br /> Recently more sophisticated botnets have begun using dstributed control systems, communicating information and commands peer-to-peer to avoid "+
		"the vulnerable single-point-of-failure represented by the C&C server.",

	'Cryptolocker': "Cryptolocker is a variant of ransomware that restricts access to infected computers by encrypting files while demanding that victims pay a ransom in order to "+
		"regain their data. Once a computer is infected with this malware, a pop-up window appears demanding a sum of money, usually between $100 to $300, paid via GreenDot, MoneyPack or "+
		"Bitcoins. The victim is then given a window of 72 to 100 hours to pay the ransom, after which time they are told they will lose the ability to decrypt their files. <br /> Cryptolocker "+
		"has unique characteristics, as it not only encrypts files on the local computer, but it may also encrypt files located within shared network drives, USB drives, external hard drives and "+
		"even some cloud storage drives. This means that if the malware infects one user who has access to all the shared file drives within an organization's network, it is possible that all "+
		"those files may become encrypted. <br /> At this time, the primary means of infection appears to be phishing emails that contain malicious attachments. Reports indicate that these emails "+
		"use the following themes, however other themes may also be used.",

	'Dshield': 'DShield is a community-based collaborative firewall log correlation system which tracks the top attacking subnets. Attacks indicates the number of targets reporting scans from a subnet.',

	'FArtifactsRAT': "The Eclipse RAT malware provides remote access to an infected machine.  This IOC is based on basis static analysis of numerous identified payloads.  "+
		"Some import functions in KERNEL32.dll and ADVAPI32.dll vary from sample to sample, and one sample does not include the WININet.dll import.  Additionally, samples appear to have "+
		"evolved over time to combine or modularize functionality, as ADVAPI32.dll import functions for one sample appears to fully combine the import functions of two distinct "+
		"combinations from different samples.  These samples have been used in targeted attacks.  Samples included both client and server samples.",

	'FArtifactsSkyiPotWyksoi': "A variant of the Sykipot/Wyksol Trojan used in recent attacks.  This malware was distributed as a drive-by download exploiting CVE-2012-1889.  "+
		"The initial payload (834D1D492E873DFD0C47A91B221E0258) is XOR encoded with a key of 0x95, skipping any bytes that are 0x00 or 0x95.  This uuencoded payload has been used "+
		"in multiple targeted campaigns to provide backdoor access to infected systems",

	'MandiantAPT1': "This report is focused on the most prolific cyber espionage group Mandiant tracks: APT1.  This single organization has conducted a cyber espionage campaign against a braod range of victims since at least 2006",

	'Malware Domain': "Domains that are known to be used to propagate malware. Malware is malicious computer software which interferes with normal computer functions or sends personal data about the user to unauthorized parties over the Internet.",

	'Phishing Domain': "Domains linked to phishing e-mails, which is a fraudulent method activity in which perpetrators send out legitimate-looking emails in an attempt to gather personal and financial information from recipients.",

	'RBN': "The Russian Business Network (commonly abbreviated as RBN) is a "+
		"multi-faceted cybercrime organization, specializing in and in some cases monopolizing personal identity theft for resale. It is the originator of MPack and an "+
		"alleged operator of the now defunct Storm botnet. <br /> The RBN, which is notorious for its hosting of illegal and dubious businesses, originated as an Internet service provider "+
		"for child pornography, phishing, spam, and malware distribution physically based in St. Petersburg, Russia. By 2007, it developed partner and affiliate marketing techniques in "+
		" many countries to provide a method for organized crime to target victims internationally. <br /> IP address ranges from which the former customers of the RBN ISP, their malware "+
		"marketing affiliate networks, emulators, and other organized crime groups exploit consumers. Block at will. Test for your production environment prior to utilization. In cases where "+
		"a malicious domain occupies an IP address used by many domains, the IP address is not included in this list.",

	'RBN Malvertiser IP': "The Russian Business Network (commonly abbreviated as RBN) is a "+
		"multi-faceted cybercrime organization, specializing in and in some cases monopolizing personal identity theft for resale. It is the originator of MPack and an "+
		"alleged operator of the now defunct Storm botnet. <br /> The RBN, which is notorious for its hosting of illegal and dubious businesses, originated as an Internet service provider "+
		"for child pornography, phishing, spam, and malware distribution physically based in St. Petersburg, Russia. By 2007, it developed partner and affiliate marketing techniques in "+
		"	many countries to provide a method for organized crime to target victims internationally. <br /> IP address ranges from which the former customers of the RBN ISP, their malware "+
		"marketing affiliate networks, emulators, and other organized crime groups exploit consumers. Block at will. Test for your production environment prior to utilization. In cases where "+
		"a malicious domain occupies an IP address used by many domains, the IP address is not included in this list.",

	'Spamhaus': "The Spamhaus Project is an international nonprofit organization whose mission is to track the Internet's spam operations and sources, to provide dependable real-time "+
		"anti-spam protection for Internet networks, to work with Law Enforcement Agencies to identify and pursue spam and malware gangs worldwide, and to lobby governments for effective "+
		"anti-spam legislation.",

	'Spyware Domain': "Domains known to distribute spyware software, which often aids in gathering information about a person or organization without their knowledge and may send such information to another entity without the consumer's consent, or that asserts control over a computer without the consumer's knowledge",

	'Suspicious Domain': "The rapidPHIRE system has detected one or more requests to specific remote domains which characteristically have been known to host malicious exploits and executable files.  Any download of these files should be further investigated as they may result in the compromise of the target computer.",

	'TOR Exit Node': "Tor (an acronym for The Onion Router) is a free software for enabling online anonymity. Tor directs Internet traffic through a free, worldwide, volunteer network "+
		"consisting of thousands of relays to conceal a user's location or usage from anyone conducting network surveillance or traffic analysis <br /> As Tor does not, and by design cannot, "+
		"encrypt the traffic between an exit node and the target server, any exit node is in a position to capture any traffic passing through it that does not use end-to-end encryption "+
		"such as TLS. While this may not inherently breach the anonymity of the source, traffic intercepted in this way by self-selected third parties can expose information about the "+
		"source in either or both of payload and protocol data.",

	'Trojan-Activity': "Trojan, is a non-self-replicating type of malware program containing malicious code that, when executed, carries out actions determined by the nature of the Trojan, "+
		"typically causing loss or theft of data, and possible system harm. <br /> Trojans often acts as a backdoor, contacting a controller which can then have unauthorized access to "+
		"the affected computer. The Trojan and backdoors are not themselves easily detectable, but if they carry out significant computing or communications activity may cause the "+
		"computer to run noticeably slowly. Malicious programs are classified as Trojans if they do not attempt to inject themselves into other files (computer virus) or otherwise "+
		"propagate themselves (worm). A computer may host a Trojan via a malicious program a user is duped into executing (often an e-mail attachment disguised to be unsuspicious) or by "+
		"drive-by download.",

	'TrendMicroSafe': "This research paper document the operations of a campaign we refer to as 'Safe'. Based on the names of the malicious files used.  It is an emerging and active targeted threat.",

	'Worm Detected': "A computer worm is a standalone malware computer program that replicates itself in order to spread to other computers. Often, it uses a computer network to spread "+
		"itself, relying on security failures on the target computer to access it. Unlike a computer virus, it does not need to attach itself to an existing program. Worms almost always "+
		"cause at least some harm to the network, even if only by consuming bandwidth, whereas viruses almost always corrupt or modify files on a targeted computer. <br /> Many worms that have "+
		"been created are designed only to spread, and do not attempt to change the systems they pass through. However, as the Morris worm and Mydoom showed, even these 'payload free' worms can "+
		"cause major disruption by increasing network traffic and other unintended effects. A 'payload' is code in the worm designed to do more than spread the worm—it might delete files on a "+
		"host system (e.g., the ExploreZip worm), encrypt files in a cryptoviral extortion attack, or send documents via e-mail. A very common payload for worms is to install a backdoor in the "+
		"infected computer to allow the creation of a 'zombie' computer under control of the worm author. Networks of such machines are often referred to as botnets and are very commonly used "+
		"by spam senders for sending junk email or to cloak their website's address. Spammers are therefore thought to be a source of funding for the creation of such worms, and the worm "+
		"writers have been caught selling lists of IP addresses of infected machines. Others try to blackmail companies with threatened DoS attacks."
			
};