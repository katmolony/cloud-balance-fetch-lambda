const { STSClient, AssumeRoleCommand } = require("@aws-sdk/client-sts");
const { CostExplorerClient, GetCostAndUsageCommand } = require("@aws-sdk/client-cost-explorer");
const { EC2Client, DescribeInstancesCommand } = require("@aws-sdk/client-ec2");

exports.handler = async (event) => {
  console.log("🚀 Incoming event:", JSON.stringify(event, null, 2));
  console.log("FETCH LAMBDA INVOKED");
  console.log("event body:", JSON.stringify(event, null, 2));

  let body;
  if (event.body) {
    body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
  } else {
    body = event;
  }

  console.log("📦 Parsed body:", body);

  const { user_id, role_arn, external_id } = body;
  if (!user_id || !role_arn) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing user_id or role_arn" }),
    };
  }

  try {
    // Step 1: Assume Role
    console.log("📡 About to assume role:", role_arn);
    const stsClient = new STSClient({ region: "us-east-1" });
    const assumeParams = {
      RoleArn: role_arn,
      RoleSessionName: `cloudbalance-session-${user_id}`,
      ExternalId: external_id,
    };
    const { Credentials } = await stsClient.send(new AssumeRoleCommand(assumeParams));
    console.log("✅ STS AssumeRole succeeded");

    // Step 2: Use temporary creds to call AWS services
    const awsCreds = {
      accessKeyId: Credentials.AccessKeyId,
      secretAccessKey: Credentials.SecretAccessKey,
      sessionToken: Credentials.SessionToken,
    };

    const costClient = new CostExplorerClient({ region: "us-east-1", credentials: awsCreds });
    const ec2Client = new EC2Client({ region: "us-east-1", credentials: awsCreds });

    const now = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(now.getDate() - 7);

    const formatDate = (date) => date.toISOString().split("T")[0];

    console.log("💸 Fetching cost data...");
    const costData = await costClient.send(
      new GetCostAndUsageCommand({
        TimePeriod: {
          Start: formatDate(lastWeek),
          End: formatDate(now),
        },
        Granularity: "DAILY",
        Metrics: ["UnblendedCost"],
      })
    );
    console.log("✅ Cost data fetched");

    console.log("🖥️ Fetching EC2 instance data...");
    const ec2Data = await ec2Client.send(new DescribeInstancesCommand({}));
    console.log("✅ EC2 instance data fetched");

    return {
      statusCode: 200,
      body: JSON.stringify({
        user_id,
        cost: costData.ResultsByTime,
        ec2_instances: ec2Data.Reservations,
      }),
    };
  } catch (err) {
    console.error("Lambda Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Lambda invocation failed" }),
    };
  }
};
