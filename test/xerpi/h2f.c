/*
 * Convert base address and size to a float number to be used by the exploit.
 * By xerpi
 */

#include <stdio.h>
#include <inttypes.h>

#define DEFAULT_SIZE 0xA00000

int main(int argc, char *argv[])
{
	if (argc < 2) {
		return -1;
	}

	uint32_t addr, size;

	if (argc == 2) {
		size = DEFAULT_SIZE;
		sscanf(argv[1], "%"PRIx32, &addr);
	} else {
		sscanf(argv[1], "%"PRIx32, &addr);
		sscanf(argv[2], "%"PRIx32, &size);
	}

	uint64_t n = ((uint64_t)addr<<32) | ((size>>1)-1);

	printf("address: 0x%08X\n", addr);
	printf("size:    0x%08X (%.4f MB)\n", size, (size/1024.0)/1024.0);
	printf("[0x%08X - 0x%08X]\n", addr, addr + size);

	double *f = (double *)&n;
	printf("\n%.390lf\n\n", *f);
	return 0;
}
