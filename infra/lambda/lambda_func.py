import boto3

def lambda_handler(event: any, context: any):
    user = event['user']
    num_visitors: int = 0

    # Create a DynamoDB client
    dynamodb = boto3.resource("dynamodb")
    visitor_count_table = dynamodb.Table("visitor_count")

    response = visitor_count_table.get_item(Key={
        'id': '0'
    })
    if "Item" in response:
        num_visitors = response["Item"]["total_visitors"]
    
    num_visitors += 1

    visitor_count_table.put_item(Item={
        'id': 0,
        'count': num_visitors
    })

    return {
        'message': "Number of visitors is" + num_visitors
    }

if __name__ == "__main__":
    event = {"user": "bohn_local"}
    print(lambda_handler(event, None))