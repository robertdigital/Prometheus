# ATILA (Autonomous Technical Indicator Leveraging Application)
Node JS Crypto trading bot.
- Intended to be run on AWS-Lambda, using a cloudwatch event as a trigger to run on a specified interval, storing data to a MongoDB database.
- Intended to only use within the free-tier usage restrictions of AWS and MongoDB Atlas.
- Designed with Coinbase API in mind. This decision may change in the future.

Work in progress

Issues will be updated soon with task items for min-viable product. 





Will first implement an evaluator, which will produce a buy or a sell rating based on some factors. Will then implement an executor which will take the rating given by the evaluator and execute an order. 

Note:
To anyone reading, this is my first trading bot and is intended to be a learning process both for bot-making and algorithm trading. I do not have any guarantees attached to the performance of this bot, and any trading done through the use of this bot is done at the user's own risk. - Alan Sato (September 2019)

Contact me @ [sam.alan.sato@gmail.com] if you would like to be working on this bot, would like to make any suggestions, have any questions or are just interested in the project in general.
