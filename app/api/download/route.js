import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server.js";

// Configura el cliente de S3 para Cloudflare R2
const s3Client = new S3Client({
	region: "auto",
	endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
		secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
	},
});

function streamToBuffer(stream) {
	return new Promise((resolve, reject) => {
		const chunks = [];
		stream.on("data", (chunk) => chunks.push(chunk));
		stream.on("error", reject);
		stream.on("end", () => resolve(Buffer.concat(chunks)));
	});
}

export async function GET(req) {

      try {
            
		const searchParams = req.nextUrl.searchParams;

		const fileName = searchParams.get("fileName");

		const fileExtension = searchParams.get("fileExtension");

		const name = `${fileName}.${fileExtension}`;

		const command = new GetObjectCommand({
			Bucket: "misiones-semanales",
			Key: name,
		});

		const response = await s3Client.send(command);

		const fileBuffer = await streamToBuffer(response.Body);

		return new Response(fileBuffer, {
			headers: {
				"Content-Type": response.ContentType,
				"Content-Disposition": `attachment; filename="${fileName}${
					fileExtension ? "." + fileExtension : ""
				}"`,
			},
		});
	} catch (error) {
		console.error("Error al obtener el objeto:", error);

		return NextResponse.json(
			{ error: error.message || error },

			{ status: 500 }
		);
	}
}