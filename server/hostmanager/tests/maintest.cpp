#include "testgamemap.h"

int main(int argc, char** argv) {
    int status = 0;
    {
        TestGameMap testCase;
        status |= QTest::qExec(&testCase, argc, argv);
    }
    return status;
}
