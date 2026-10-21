
import asyncio

from server.database import client


async def test_connection():
    try:
        result = await client.admin.command("ping")
        print("MongoDB connection successful!")
        print(result)
    except Exception as e:
        print("MongoDB connection failed:")
        print(e)
    finally:
        await client.close()


if __name__ == "__main__":
    asyncio.run(test_connection())
