import { APIRequestContext } from "@playwright/test";
import { getE2eApiBaseUrl, getRequiredE2eCleanupToken } from "../config/e2e-env.config";
import { DeleteUsersByEmailResponseDTO } from "../dtos/DeleteUsersByEmailResponseDTO";

export class E2eTestApi {
  private readonly apiBaseUrl: string = getE2eApiBaseUrl();

  constructor(private readonly request: APIRequestContext) {}

  async deleteUsersByEmail(emails: string[]): Promise<void> {
    if (emails.length === 0) {
      return;
    }

    const cleanupResponse = await this.request.delete(`${this.apiBaseUrl}/test/users`, {
      headers: this.getTestHeaders(),
      data: emails,
    });

    if (!cleanupResponse.ok()) {
      throw new Error(
        `Could not clean up registered E2E users. Status: ${cleanupResponse.status()}. Body: ${await cleanupResponse.text()}`,
      );
    }

    const cleanupResult = (await cleanupResponse.json()) as DeleteUsersByEmailResponseDTO;
    this.assertEveryEmailWasReported(emails, cleanupResult);
  }

  private getTestHeaders(): Record<string, string> {
    return {
      "X-Test-Cleanup-Token": getRequiredE2eCleanupToken(),
    };
  }

  private assertEveryEmailWasReported(
    emails: string[],
    cleanupResult: DeleteUsersByEmailResponseDTO,
  ): void {
    const unreportedEmails = emails.filter((email) => {
      return !cleanupResult.deleted.includes(email) && !cleanupResult.notFound.includes(email);
    });

    if (unreportedEmails.length > 0) {
      throw new Error(
        `Cleanup response did not report these E2E users: ${unreportedEmails.join(", ")}`,
      );
    }
  }
}
